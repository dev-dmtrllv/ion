use crate::{
    any_err::AnyResult,
    err,
    path::Path,
    token::{list::List, token::Token},
};

pub trait AstParser<'a> {
    fn parse(parser: &mut Parser<'a>) -> AnyResult<Self>
    where
        Self: Sized;
}

pub struct Parser<'a> {
    path: &'a Path,
    tokens: &'a List<'a>,
    index: usize, // always points to the next token
}

#[allow(unused)]
impl<'a> Parser<'a> {
    pub fn new(tokens: &'a List<'a>, path: &'a Path) -> Self {
        Self {
            tokens,
            index: 0,
            path,
        }
    }

    pub fn current(&self) -> Option<&'a Token<'a>> {
        if self.index > 0 {
            self.tokens.get(self.index - 1)
        } else {
            None
        }
    }

    pub fn next(&mut self) -> Option<&'a Token<'a>> {
        if let Some(t) = self.tokens.get(self.index) {
            self.index += 1;
            Some(t)
        } else {
            None
        }
    }

    pub fn next_or_err(&mut self) -> AnyResult<&'a Token<'a>> {
        if let Some(t) = self.next() {
            Ok(t)
        } else {
            self.unexpected()
        }
    }

    pub fn peek_next(&self) -> Option<&'a Token<'a>> {
        self.tokens.get(self.index)
    }

    pub fn skip(&mut self, count: usize) {
        self.index += count;
    }

    pub fn unexpected<T>(&self) -> AnyResult<T> {
        if let Some(t) = self.current() {
            let loc_index = if self.index == 0 { 0 } else { self.index - 1 };
            if let Some(loc) = self.tokens.locations.get(loc_index) {
                err!(
                    "Did not expect {t} at {}:{}:{}!",
                    self.path,
                    loc.line,
                    loc.col
                )
            } else {
                err!("Did not expect {t}!")
            }
        } else {
            err!("Did not expect end of file!")
        }
    }

    pub fn expect_next(&mut self, token: Token<'a>) -> AnyResult<&'a Token<'a>> {
        if let Some(t) = self.next() {
            if *t == token {
                Ok(t)
            } else {
				let loc_index = if self.index == 0 { 0 } else { self.index - 1 };
                if let Some(loc) = self.tokens.locations.get(loc_index) {
                    err!(
                        "Expected {token}, found {t} at {}:{}:{}!",
                        self.path,
                        loc.line,
                        loc.col
                    )
                } else {
                    err!("Expected {token}, found {t}!")
                }
            }
        } else {
            err!("Expected an identifier, found end of file!")
        }
    }

    pub fn get_ident(&mut self) -> AnyResult<&'a str> {
        if let Some(t) = self.next() {
            match t {
                Token::Identifier(str) => Ok(str),
                _ => err!("Expected an identifier, found {t}!"),
            }
        } else {
            err!("Expected an identifier, found end of file!")
        }
    }

    pub fn next_if(&mut self, token: Token<'a>) -> bool {
        if let Some(t) = self.peek_next() {
            if t == &token {
                self.skip(1);
                true
            } else {
                false
            }
        } else {
            false
        }
    }

    // todo: (enter/leave)_named_scope(name: &'a str) {}
    // todo: get_scope_name() -> &'a str {}
}
