use crate::{any_err::AnyResult, ast::parser::AstParser, token::token::Token};

use super::{expression::Expression, parser::Parser, statement::Statement};

#[derive(Debug)]
pub enum Scope<'a> {
	Statements(Vec<Statement<'a>>),
	Expression(Box<Expression<'a>>),
	Struct(),
}

impl<'a> Scope<'a> {
	pub fn parse_statements(parser: &mut Parser<'a>) -> AnyResult<Scope<'a>> {
		let mut statements = vec![];
		
		loop {
			if parser.next_if(Token::Separator("}")) {
				break;
			} else {
				statements.push(Statement::parse(parser)?)
			}
		}
		
		Ok(Self::Statements(statements))
	}

	pub fn parse_expression(parser: &mut Parser<'a>) -> AnyResult<Scope<'a>> {
		let expr = Expression::parse(parser)?;
		parser.expect_next(Token::Separator(")"))?;
		Ok(Scope::Expression(Box::new(expr)))
	}
}
