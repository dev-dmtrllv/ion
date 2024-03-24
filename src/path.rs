use std::{fmt::Display, path::PathBuf};

use crate::any_err::{AnyResult, AsAnyErr};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Path(pub PathBuf);

impl Display for Path {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if let Some(str) = self.0.to_str() {
            write!(f, "{}", str)
        } else {
            Err(std::fmt::Error)
        }
    }
}

impl Path {
    #[allow(unused)]
    #[cfg(not(target_os = "windows"))]
    pub fn canonicalize(&self) -> PathBuf {
        todo!("canonicalize for linux/mac")
    }

    #[allow(unused, unconditional_recursion)]
    #[cfg(target_os = "windows")]
    pub fn canonicalize(&self) -> AnyResult<PathBuf> {
        let p = self.0.canonicalize().as_any_err()?;
        let p = p.as_path().to_str().as_any_err()?;

        const VERBATIM_PREFIX: &str = r#"\\?\"#;
        Ok(PathBuf::from(if p.starts_with(VERBATIM_PREFIX) {
            p[VERBATIM_PREFIX.len()..].to_string()
        } else {
            p.to_string()
        }))
    }
}
