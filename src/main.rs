mod any_err;
mod ast;
mod compiler;
mod path;
mod token;

pub use crate::compiler::Compiler;

fn main() {
	match Compiler::compile() {
		Ok(info) => println!(
			"Compiled {} in {} ms!",
			&info.path,
			info.duration.as_millis()
		),
		Err(err) => {
			println!("\n{err}\n");
		},
	}
}
