use crate::{any_err::AnyResult, token::token::Token};

use super::{function::Function, parser::{AstParser, Parser}};

#[derive(Debug)]
pub enum Export<'a> {
	Function(Function<'a>)
}

impl<'a> AstParser<'a> for Export<'a> {
	fn parse(parser: &mut Parser<'a>) -> AnyResult<Self> where Self: Sized {
		Ok(match parser.next_or_err()? {
			Token::Keyword("fn") => Export::Function(Function::parse(parser)?),
			// Token::Keyword("struct") => Export::Function(Function::parse(parser)),
			_ => parser.unexpected()?,
		})
	}
}
