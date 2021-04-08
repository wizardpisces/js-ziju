export const enum NodeTypes {
    //ExpressionStatement
    MemberExpression = 'MemberExpression',
    AssignmentExpression = 'AssignmentExpression',
    ExpressionStatement = 'ExpressionStatement',
    BinaryExpression = 'BinaryExpression',
    CallExpression = 'CallExpression',
    UpdateExpression = 'UpdateExpression',
    Identifier = 'Identifier',
    Literal = 'Literal',
    
    VariableDeclaration = 'VariableDeclaration',
    VariableDeclarator = 'VariableDeclarator',
    
    FunctionDeclaration = 'FunctionDeclaration',

    BlockStatement = 'BlockStatement',

    ReturnStatement = 'ReturnStatement',

    // flow control
    WhileStatement = 'WhileStatement',
    IfStatement = 'IfStatement',
}