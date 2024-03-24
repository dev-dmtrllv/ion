use std::fmt::Display;

use crate::{
    any_err::AnyResult,
    ast::import::Import,
    path::Path,
    token::{list::List, token::Token},
};

use super::{
    export::Export,
    function::Function,
    parser::{AstParser, Parser},
    r#use::Use,
};

pub struct Module<'a> {
    path: &'a Path,
    imports: Vec<Import<'a>>,
    uses: Vec<Use<'a>>,
    exports: Vec<Export<'a>>,
    functions: Vec<Function<'a>>,
}

impl<'a> Module<'a> {
    pub fn parse(path: &'a Path, tokens: &'a List<'a>) -> AnyResult<Module<'a>> {
        let mut parser = Parser::new(tokens);

        let mut imports = vec![];
        let mut uses = vec![];
        let mut exports = vec![];
        let mut functions = vec![];

        while let Some(t) = parser.next() {
            match t {
                Token::Keyword("import") => imports.push(Import::parse(&mut parser)?),
                Token::Keyword("use") => uses.push(Use::parse(&mut parser)?),
                Token::Keyword("export") => exports.push(Export::parse(&mut parser)?),
                Token::Keyword("fn") => functions.push(Function::parse(&mut parser)?),
                _ => return parser.unexpected(),
            }
        }

        Ok(Self {
            path,
            imports,
            uses,
            exports,
            functions,
        })
    }
}

impl<'a> Display for Module<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "Module {}", self.path)?;
        writeln!(
            f,
            "Imports: {:#?}",
            self.imports
                .iter()
                .map(|t| { t.0.join(".") })
                .collect::<Vec<_>>()
        )?;
        writeln!(
            f,
            "uses: {:#?}",
            self.uses
                .iter()
                .map(|t| { t.0.join("::") })
                .collect::<Vec<_>>()
        )?;
        writeln!(f, "exports: {:#?}", self.exports)?;
        writeln!(f, "functions: {:#?}", self.functions)?;
        Ok(())
    }
}
