use std::{
    collections::HashMap, env, fs::read_to_string, path::PathBuf, time::{Duration, Instant}
};

use crate::{
    any_err::{AnyErr, AnyResult, AsAnyErr}, ast::module::Module, path::Path, token::{list::List, parser::Parser}
};

struct TokenMap<'a>(pub HashMap<&'a Path, List<'a>>);

struct AstMap<'a>(pub HashMap<&'a Path, Module<'a>>);

pub struct Compiler;

impl Compiler {
    fn get_project_dir() -> AnyResult<Path> {
        fn cwd() -> AnyResult<PathBuf> {
            env::current_dir().as_any_err()
        }

        let args: Vec<String> = env::args().collect();

        if args.len() >= 2 {
            let path = Path(PathBuf::from(&args[1])).canonicalize()?;
            if path.is_absolute() {
                Ok(Path(path))
            } else {
                Ok(Path(cwd()?.as_path().join(path)))
            }
        } else {
            Ok(Path(cwd()?))
        }
    }

    fn parse_tokens(sources: &HashMap<Path, Box<str>>) -> AnyResult<TokenMap> {
        let mut tokens = HashMap::<&Path, List>::new();
        for (path, source) in sources {
			let tokens_list = Parser::parse(source)?;
			if cfg!(debug_assertions) {
				println!("|{:-<47}|", "");
				println!("| {:<45} |\n{tokens_list:#}", format!("Module \"{path}\""));
			}
            tokens.insert(path, tokens_list);
        }
        Ok(TokenMap(tokens))
    }

	#[allow(unused)]
    fn parse_asts<'a>(map: &'a TokenMap) -> AnyResult<AstMap<'a>> {
		let mut ast_map = AstMap(HashMap::new());
		for (path, tokens) in &map.0 {
			let module = Module::parse(path, tokens)?;
			if cfg!(debug_assertions) {
				println!("{module}");
			}
			ast_map.0.insert(path, module);
		}
		Ok(ast_map)
    }

	#[allow(unused)]
    pub fn compile() -> AnyResult<CompileInfo> {
        let start = Instant::now();
        let path = Self::get_project_dir()?;
        let sources = Self::get_sources(&path)?;
        let tokens = Self::parse_tokens(&sources)?;
		
		let asts = Self::parse_asts(&tokens)?;
        let elapsed = start.elapsed();

        Ok(CompileInfo {
            path,
            duration: elapsed,
        })
    }

    fn get_sources(path: &Path) -> AnyResult<HashMap<Path, Box<str>>> {
        fn parse_dir(modules: &mut HashMap<Path, Box<str>>, dir: PathBuf) -> AnyResult {
            if !dir.exists() {
                return AnyErr::new(format!("{} does not exists!", Path(dir)));
            } else if dir.is_file() {
                let string = read_to_string(&dir).as_any_err()?.into_boxed_str();
                modules.insert(Path(dir.clone()), string);
            } else {
                for p in dir.read_dir().as_any_err()? {
                    let p = p.as_any_err()?.path();
                    parse_dir(modules, p)?;
                }
            }
            Ok(())
        }

        let mut dir = path.0.clone();
        let mut modules: HashMap<Path, Box<str>> = HashMap::new();
        dir.push("src");

        parse_dir(&mut modules, dir)?;
        Ok(modules)
    }
}

pub struct CompileInfo {
    pub path: Path,
    pub duration: Duration,
}
