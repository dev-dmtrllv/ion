use crate::{any_err::AnyResult, token::token::Token};

use super::{assignment::Assignment, expression::Expression, parser::{AstParser, Parser}, r#use::Use};

#[derive(Debug)]
pub enum Statement<'a> {
	Assignment(Assignment<'a>),
	Use(Use<'a>),
	Expression(Expression<'a>),
}

impl<'a> AstParser<'a> for Statement<'a> {
	fn parse(parser: &mut Parser<'a>) -> AnyResult<Self> where Self: Sized {
		if let Some(token) = parser.peek_next() {
			let stmt = match token {
				Token::Identifier(_) => Self::Expression(Expression::parse(parser)?),
				_ => {
					let stmt = match parser.next_or_err()? {
						Token::Keyword("mut") => Self::Assignment(Assignment::parse(parser, true)?),
						Token::Keyword("let") => Self::Assignment(Assignment::parse(parser, false)?),
						Token::Keyword("use") => Self::Use(Use::parse(parser)?),
						_ => parser.unexpected()?
					};
			
					stmt
				}
			};
	
			parser.expect_next(Token::Separator(";"))?;
	
			Ok(stmt)
		} else {
			parser.unexpected()?
		}
	}
}
