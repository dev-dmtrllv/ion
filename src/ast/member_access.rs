use crate::{any_err::AnyResult, token::token::Token};

use super::{expression::Expression, function::FunctionCall, parser::{AstParser, Parser}};

#[derive(Debug)]
pub struct MemberAccess<'a> {
	pub left: Box<Expression<'a>>,
	pub right: Box<Expression<'a>>,
}
