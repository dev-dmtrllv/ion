use crate::{any_err::AnyResult, token::token::Token};

use super::{expression::Expression, parser::{AstParser, Parser}};

#[derive(Debug)]
pub struct Assignment<'a> {
    pub mutable: bool,
    pub name: &'a str,
	pub expr: Expression<'a>,
}

impl<'a> Assignment<'a> {
    pub fn parse(parser: &mut Parser<'a>, mutable: bool) -> AnyResult<Self> {
        let name = parser.get_ident()?;
		parser.expect_next(Token::Operator("="))?;
		Ok(Self {
			mutable,
			name,
			expr: Expression::parse(parser)?
		})
    }
}
