use crate::{any_err::AnyResult, token::token::Token};

use super::{parser::{AstParser, Parser}, scope::Scope};

type Args<'a> = Vec<&'a Token<'a>>;

#[derive(Debug)]
pub struct Function<'a> {
	pub name: &'a str,
	pub args: Args<'a>,
	pub scope: Scope,
}

impl<'a> Function<'a> {
	fn parse_arguments(parser: &mut Parser<'a>) -> AnyResult<Args<'a>> {
		parser.expect_next(Token::Separator("("))?;
		let mut args = vec![];
		
		loop {
			let t = parser.next_or_err()?;
			match t {
				Token::Separator(")") => break,
				_ => args.push(t),
			}
		}
		
		Ok(args)
	}

	fn parse_scope(parser: &mut Parser<'a>) -> AnyResult<Scope> {
		parser.expect_next(Token::Separator("{"))?;
		Scope::parse_statements(parser)
	}
}

impl<'a> AstParser<'a> for Function<'a> {
	fn parse(parser: &mut Parser<'a>) -> AnyResult<Self> where Self: Sized {
		Ok(Self {
			name: parser.get_ident()?,
			args: Self::parse_arguments(parser)?,
			scope: Self::parse_scope(parser)?
		})
	}
}
