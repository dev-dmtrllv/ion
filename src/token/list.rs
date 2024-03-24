use std::fmt::Display;

use crate::any_err::AsAnyErr;

use super::{location::Location, parser::ParsedToken, token::Token};

#[derive(Debug)]
pub struct List<'a> {
    pub tokens: Vec<Token<'a>>,
    pub locations: Vec<Location>,
}

#[allow(unused)]
impl<'a> List<'a> {
    pub fn new() -> Self {
        Self {
            tokens: vec![],
            locations: vec![],
        }
    }

    pub fn push(&mut self, parsed_tokens: ParsedToken<'a>) {
        let (token, loc) = parsed_tokens;
        self.tokens.push(token);
        self.locations.push(loc);
    }

    pub fn get(&self, index: usize) -> Option<&Token<'a>> {
        self.tokens.get(index)
    }
}

impl<'a> Display for List<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if f.alternate() {
			writeln!(f, "|{:-<15}|{:-<15}|{:-<15}|", "", "", "")?;
			writeln!(f, "| {:<14}| {:<14}| {:<14}|", "Location:", "Type:", "Value:")?;
			writeln!(f, "|{:-<15}|{:-<15}|{:-<15}|", "", "", "")?;
            for i in 0..self.tokens.len() {
                let token = self.tokens.get(i).ok_or(std::fmt::Error)?;
                let loc = self.locations.get(i).ok_or(std::fmt::Error)?;
                writeln!(
                    f,
                    "| {:<14}| {:<14}| {:<14}|",
					format!("Ln {}, Col {}", loc.line, loc.col),
                    token.name(),
					token.value(),
                )?;
            }
			writeln!(f, "|{:-<15}|{:-<15}|{:-<15}|", "", "", "")?;
        } else {
            for t in &self.tokens {
                writeln!(f, "{t}")?;
            }
        }
        Ok(())
    }
}
