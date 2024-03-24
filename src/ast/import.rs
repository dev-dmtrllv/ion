use std::fmt::Display;

use super::parser::AstParser;

use crate::{any_err::AnyResult, token::token::*};

pub struct Import<'a>(pub Vec<&'a str>);

impl<'a> AstParser<'a> for Import<'a> {
	fn parse(parser: &mut super::parser::Parser<'a>) -> AnyResult<Self> {
		let mut identifiers = vec![];

		loop {
			identifiers.push(parser.get_ident()?);
			match parser.next_or_err()? {
				Token::Separator(".") => continue,
				Token::Separator(";") => break,
				_ => parser.unexpected()?
			}
		}



		Ok(Self(identifiers))
	}
}

impl<'a> Display for Import<'a> {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		write!(f, "{:#?}", self.0)
	}
}
