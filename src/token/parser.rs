use crate::any_err::{AnyErr, AnyResult};

use super::{
    identifier::is_identifier,
    keyword::is_keywords,
    operator::{is_operator, is_str_operator},
	location::Location,
	list::List,
    seperator::{is_ignorable_seperator, is_seperator},
    token::Token,
};

pub struct Parser;

fn is_number_literal(str: &str) -> bool {
    for c in str.chars() {
        if !c.is_numeric() {
            return false;
        }
    }
    true
}

pub type ParsedToken<'a> = (Token<'a>, Location);

impl Parser {
    fn parse_buffer<'a>(buffer: &'a str, loc: &mut Location) -> ParsedToken<'a> {
        if let Some(token) = Self::try_parse_buffer(buffer, loc) {
            token
        } else if is_identifier(buffer) {
            (Token::Identifier(buffer), loc.clone_from_buffer(buffer))
        } else if is_number_literal(buffer) {
            (Token::NumberLiteral(buffer), loc.clone_from_buffer(buffer))
        } else {
            (Token::Unknown(buffer), loc.clone())
        }
    }

    fn try_parse_buffer<'a>(buffer: &'a str, loc: &mut Location) -> Option<ParsedToken<'a>> {
        if is_keywords(buffer) {
            Some((Token::Keyword(buffer), loc.clone_from_buffer(buffer)))
        } else if is_str_operator(buffer) {
            Some((Token::Operator(buffer), loc.clone_from_buffer(buffer)))
        } else {
            None
        }
    }

    fn parse_seperator<'a>(buffer: &'a str, loc: &mut Location) -> ParsedToken<'a> {
		(Token::Separator(buffer), loc.clone_from_buffer(buffer))
    }

	fn parse_operator<'a>(buffer: &'a str, loc: &mut Location) -> ParsedToken<'a> {
        (Token::Operator(buffer), loc.clone_from_buffer(buffer))
    }

    fn parse_string_literal<'a>(iter: &mut CharIter<'a>, loc: &mut Location) -> ParsedToken<'a> {
        let mut escape = false;
        let start = iter.index;
        while let Some(char) = iter.next() {
            if escape {
                escape = false;
            } else if char == '\\' {
                escape = true;
            } else if char == '"' {
                break;
            }
        }
		let str = &iter.source[start..iter.index - 1];
        (
            Token::StringLiteral(str),
            loc.clone_from_buffer(str),
        )
    }

    fn parse_char_literal<'a>(
        iter: &mut CharIter<'a>,
        loc: &mut Location,
    ) -> AnyResult<ParsedToken<'a>> {
        if let Some((str, _)) = iter.collect_while(&|a, _| a != '\'') {
            if (str.len() == 2 && str.chars().nth(0).unwrap() != '\\') || str.len() > 2 {
                AnyErr::new(format!(
                    "Too many characters ({}) in char! '{}'",
                    str.len(),
                    str
                ))
            } else {
                Ok((Token::CharLiteral(str), loc.clone_from_buffer(str)))
            }
        } else {
            AnyErr::new("???")
        }
    }

    pub fn parse<'a>(source: &'a str) -> AnyResult<List<'a>> {
        // let mut tokens: Vec<ParsedToken<'a>> = vec![];
		let mut list = List::new();
        let mut loc = Location::new();
        let mut iter = CharIter::new(source);

        while let Some((str, char)) = iter.collect_while(&|char, _| !is_seperator(char) && !is_operator(char)) {
            if str.len() > 0 {
                list.push(Self::parse_buffer(str, &mut loc))
            }
			
			match char {
                "\"" => list.push(Parser::parse_string_literal(&mut iter, &mut loc)),
                "'" => list.push(Parser::parse_char_literal(&mut iter, &mut loc)?),
                _ => {
                    if let Some(char) = char.chars().nth(0) {
                        if !is_ignorable_seperator(char) {
							let buf = &iter.source[iter.index - 1..iter.index];
                            if is_str_operator(buf) {
								list.push(Parser::parse_operator(
									buf,
									&mut loc,
								))
							} else {
								list.push(Parser::parse_seperator(
									buf,
									&mut loc,
								))
							}
                        } else {
							loc.advance_from_char(char)
						}
                    }
                }
            }
        }

        Ok(list)
    }
}

struct CharIter<'a> {
    source: &'a str,
    index: usize,
    count: usize,
}

impl<'a> CharIter<'a> {
    pub fn new(source: &'a str) -> Self {
        Self {
            source,
            index: 0,
            count: source.len(),
        }
    }

    pub fn next(&mut self) -> Option<char> {
        if self.index >= self.count {
            None
        } else {
            let i = self.index;
            self.index += 1;
            self.source.chars().nth(i)
        }
    }

    pub fn collect_while<T: Fn(char, &CharIter) -> bool>(
        &mut self,
        closure: &T,
    ) -> Option<(&'a str, &'a str)> {
        if self.index >= self.count {
            None
        } else {
            let i = self.index;
            while let Some(char) = self.next() {
                if !closure(char, self) {
                    return Some((
                        &self.source[i..self.index - 1],
                        &self.source[self.index - 1..self.index],
                    ));
                }
            }

            Some((
                &self.source[i..self.index - 1],
                &self.source[self.index - 1..self.index - 1],
            ))
        }
    }
}
