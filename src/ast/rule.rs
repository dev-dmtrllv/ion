pub enum RuleItem<'a> {
	Ident,
	Keyword(&'a str),
	Op(&'a str),
	Sep(&'a str)
}
