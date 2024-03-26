use crate::{any_err::AnyResult, token::token::Token};

use super::{
    function::FunctionCall,
    index_access::IndexedAccess,
    member_access::MemberAccess,
    parser::{AstParser, Parser},
    scope::Scope,
};

#[derive(Debug)]
pub enum Expression<'a> {
    Scope(Scope<'a>),
    FunctionCall(FunctionCall<'a>),
    NumberLiteral(&'a str),
    Identifier(&'a str),
    MemberAccess(MemberAccess<'a>),
    IndexedAccess(IndexedAccess<'a>),
}

impl<'a> Expression<'a> {
    fn parse_indexed_op(parser: &mut Parser<'a>, left: Expression<'a>) -> AnyResult<Self> {
        let ast = Self::IndexedAccess(IndexedAccess {
            left: Box::new(left),
            index: Box::new(Expression::parse(parser)?),
        });
		parser.expect_next(Token::Separator("]"))?;

		Ok(if parser.next_if(Token::Operator(".")) {
            Self::parse_dot_op(parser, ast)?
        } else if parser.next_if(Token::Separator("(")) {
            Self::FunctionCall(FunctionCall::parse(parser, ast)?)
        } else if parser.next_if(Token::Separator("[")) {
            Self::parse_indexed_op(parser, ast)?
        } else if let Some(t) = parser.peek_next() {
            match t {
				Token::Separator(_) => ast,
                _ => parser.unexpected()?,
            }
        } else {
            parser.unexpected()?
        })
    }

    fn parse_dot_op(parser: &mut Parser<'a>, left: Expression<'a>) -> AnyResult<Self> {
        Ok(match parser.next_or_err()? {
            Token::Identifier(name) => Self::MemberAccess(MemberAccess {
                left: Box::new(left),
                right: Box::new(Expression::parse_named(parser, name)?),
            }),
            _ => parser.unexpected()?,
        })
    }

    fn parse_named(parser: &mut Parser<'a>, name: &'a str) -> AnyResult<Self> {
        Ok(if parser.next_if(Token::Operator(".")) {
            Self::parse_dot_op(parser, Expression::Identifier(name))?
        } else if parser.next_if(Token::Separator("(")) {
            Self::FunctionCall(FunctionCall::parse(parser, Expression::Identifier(name))?.with_name(name))
        } else if parser.next_if(Token::Separator("[")) {
            Self::parse_indexed_op(parser, Expression::Identifier(name))?
        } else if let Some(t) = parser.peek_next() {
            match t {
				Token::Separator(_) => Expression::Identifier(name),
                _ => parser.unexpected()?,
            }
        } else {
            parser.unexpected()?
        })
    }

    fn parse_number_literal(parser: &mut Parser<'a>, number: &'a str) -> AnyResult<Self> {
        Ok(if parser.next_if(Token::Operator(".")) {
            Self::parse_dot_op(parser, Expression::NumberLiteral(number))?
        } else if let Some(t) = parser.peek_next() {
            match t {
				Token::Separator(_) => Expression::NumberLiteral(number),
                _ => parser.unexpected()?,
            }
        } else {
            parser.unexpected()?
        })
    }
}

impl<'a> AstParser<'a> for Expression<'a> {
    fn parse(parser: &mut Parser<'a>) -> AnyResult<Self>
    where
        Self: Sized,
    {
        Ok(match parser.next_or_err()? {
            Token::Identifier(name) => Self::parse_named(parser, name)?,
            Token::NumberLiteral(number) => Self::parse_number_literal(parser, number)?,
			Token::Separator("(") => Self::Scope(Scope::parse_expression(parser)?),
            _ => parser.unexpected()?,
        })
    }
}
