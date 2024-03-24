use crate::{any_err::AnyResult, ast::parser::AstParser, token::token::Token};

use super::{expression::Expression, parser::Parser, statement::Statement};

#[derive(Debug)]
pub enum Scope {
	Statements(Vec<Statement>),
	Expression(Vec<Expression>),
	Struct(),
}

impl Scope {
	pub fn parse_statements<'a>(parser: &mut Parser<'a>) -> AnyResult<Scope> {
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
}
