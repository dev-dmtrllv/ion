use std::fmt::{Debug, Display};

#[allow(unused)]
pub struct AnyErr {
    origin: String,
    error: String,
    contexts: Vec<AnyErr>,
	backtrace: String,
}

#[cfg(feature = "enable_backtrace")]
fn get_backtrace() -> String {
    use std::backtrace::Backtrace;

	format!("{}", Backtrace::force_capture())
}

#[cfg(not(feature = "enable_backtrace"))]
fn get_backtrace() -> String {
	String::new()
}

impl AnyErr {
    #[track_caller]
    pub fn new<T, Err: Display>(err: Err) -> Result<T, Self> {
        let l = std::panic::Location::caller();

        Err(Self {
            origin: format!("{}:{}:{}", l.file(), l.line(), l.column()),
            error: format!("{}", err),
            contexts: vec![],
			backtrace: get_backtrace()
        })
    }

    #[track_caller]
    pub fn new_unwrapped<T, Err: Display>(err: Err) -> Self {
        let l = std::panic::Location::caller();

        Self {
            origin: format!("{}:{}:{}", l.file(), l.line(), l.column()),
            error: format!("{}", err),
            contexts: vec![],
			backtrace: get_backtrace()
        }
    }

    #[allow(unused)]
    #[track_caller]
    pub fn ctx(&mut self, str: &str) -> &mut Self {
        let l = std::panic::Location::caller();
        self.contexts.push(AnyErr::new_unwrapped::<(), &str>(str));
        self
    }

    #[allow(unused)]
    #[track_caller]
    pub fn with<T>(mut self, str: &str) -> Result<T, Self> {
        let l = std::panic::Location::caller();
        self.contexts.push(AnyErr::new_unwrapped::<(), &str>(str));
        std::result::Result::Err(self)
    }

    pub fn add_ctx(&mut self, str: &str) -> &mut Self {
        self.contexts.push(AnyErr::new_unwrapped::<(), &str>(str));
        self
    }
}

pub trait WithError<T> {
    fn add_if_err(self, str: &str) -> core::result::Result<T, AnyErr>;
}

impl<T> WithError<T> for core::result::Result<T, AnyErr> {
    #[allow(unused)]
    #[track_caller]
    fn add_if_err(self, str: &str) -> core::result::Result<T, AnyErr> {
        match self {
            Ok(val) => Ok(val),
            Err(mut err) => {
                let l = std::panic::Location::caller();
                err.add_ctx(format!("{}:{}:{} {}", l.file(), l.line(), l.column(), str).as_str());
                Err(err)
            }
        }
    }
}

pub trait AsAnyErr<T, E: Display> {
    fn as_any_err(self) -> Result<T, AnyErr>;
}

impl<T, E: Display> AsAnyErr<T, E> for Result<T, E> {
    fn as_any_err(self) -> Result<T, AnyErr> {
        match self {
            Ok(val) => Ok(val),
            Err(err) => AnyErr::new(err),
        }
    }
}

impl<T> AsAnyErr<T, String> for Option<T> {
    fn as_any_err(self) -> Result<T, AnyErr> {
        match self {
            Some(val) => Ok(val),
            None => AnyErr::new("Options is empty!"),
        }
    }
}

pub type AnyResult<T = ()> = Result<T, AnyErr>;

impl Display for AnyErr {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "{}\n  from source: {}", self.error, self.origin)?;
        for c in &self.contexts {
            write!(f, "  {}", c)?;
        }
		writeln!(f, "{}", self.backtrace)?;
        Ok(())
    }
}

impl Debug for AnyErr {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{self}")
    }
}

#[macro_export]
macro_rules! err {
	($($args: tt)*) => {
		crate::any_err::AnyErr::new(format_args!($($args)*))
	}
}
