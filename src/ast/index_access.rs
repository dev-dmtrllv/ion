use super::expression::Expression;

#[derive(Debug)]
pub struct IndexedAccess<'a> {
    pub left: Box<Expression<'a>>,
    pub index: Box<Expression<'a>>,
}
