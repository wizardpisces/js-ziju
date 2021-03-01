export const enum NodeTypes {
    //ExpressionStatement
    MemberExpression = 'MemberExpression',
    AssignmentExpression = 'AssignmentExpression',
    ExpressionStatement = 'ExpressionStatement',
    BinaryExpression = 'BinaryExpression',
    Identifier = 'Identifier',
    Literal = 'Literal',
    
    VariableDeclaration = 'VariableDeclaration',
    VariableDeclarator = 'VariableDeclarator',
    
    FunctionDeclaration = 'FunctionDeclaration',

    BlockStatement = 'BlockStatement',

    // flow control
    WhileStatement = 'WhileStatement',
}