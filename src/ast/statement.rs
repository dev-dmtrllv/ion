use crate::any_err::AnyResult;

use super::parser::{AstParser, Parser};

#[derive(Debug)]
pub enum Statement {
	Test
}

impl<'a> AstParser<'a> for Statement {
	fn parse(parser: &mut Parser<'a>) -> AnyResult<Self> where Self: Sized {
		parser.skip(1);
		Ok(Self::Test)
	}
}
