use crate::{any_err::AnyResult, token::token::Token};

use super::{expression::Expression, parser::{AstParser, Parser}, scope::Scope, statement::Statement};

type Args<'a> = Vec<&'a Token<'a>>;

#[derive(Debug)]
pub struct Function<'a> {
	pub name: &'a str,
	pub args: Args<'a>,
	pub scope: Scope<'a>,
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

	fn parse_scope(parser: &mut Parser<'a>) -> AnyResult<Scope<'a>> {
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

#[derive(Debug)]
pub struct FunctionCall<'a> {
	pub left: Box<Expression<'a>>,
	pub name: &'a str,
	pub args: Vec<Expression<'a>>,
}

impl<'a> FunctionCall<'a> {
	pub fn with_name(mut self, name: &'a str) -> Self {
		self.name = name;
		self
	}

	fn parse_args(parser: &mut Parser<'a>) -> AnyResult<Vec<Expression<'a>>> {
		let mut args = vec![];

		loop {
			if parser.next_if(Token::Separator(")")) {
				break;
			} else {
				args.push(Expression::parse(parser)?);
				if parser.next_if(Token::Separator(",")) {
					continue;
				} else {
					parser.unexpected()?;
				}
			}
		}

		Ok(args)
	}
}

impl<'a> FunctionCall<'a> {
	pub fn parse(parser: &mut Parser<'a>, left: Expression<'a>) -> AnyResult<Self> where Self: Sized {
		// we expect this function to be called after it is made clear that a function call happend
		// for now only IDENT(...) are handled by matching the IDENT and '(' character
		// TODO: handle generic types as well...
		Ok(FunctionCall { left: Box::new(left), name: "", args: Self::parse_args(parser)? })
	}
}
