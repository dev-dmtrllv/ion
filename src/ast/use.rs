use std::fmt::Display;

use super::parser::AstParser;

use crate::{any_err::AnyResult, token::token::*};

#[derive(Debug)]
pub struct Use<'a>(pub Vec<&'a str>);

impl<'a> AstParser<'a> for Use<'a> {
    fn parse(parser: &mut super::parser::Parser<'a>) -> AnyResult<Self> {
        let mut uses = vec![];

        loop {
            if let Some(t) = parser.next() {
                match t {
                    Token::Identifier(name) => {
                        uses.push(*name);
                        match parser.next_or_err()? {
                            Token::Separator(":") => {
                                parser.expect_next(Token::Separator(":"))?;
                                continue;
                            }
                            Token::Separator(";") => break,
                            _ => parser.unexpected()?,
                        }
                    }
                    Token::Operator("*") => {
                        uses.push(&t.value());
                        parser.expect_next(Token::Separator(";"))?;
                        break;
                    }
                    _ => parser.unexpected()?,
                }
            }
        }

        Ok(Self(uses))
    }
}

impl<'a> Display for Use<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:#?}", self.0)
    }
}
