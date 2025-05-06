grammar Courant;

// Parser rules

// A program is a single statement.
prog : stmt* EOF ;

// Statements
stmt
    : IDENT ASSIGN expr SEMI            #assignment
    | expr SEMI                         #exprStmt
    | RETURN expr SEMI                  #returnStmt
    | '{' stmt* '}'                     #blockStmt
    | IF '(' expr ')' stmt (ELSE stmt)? #ifStmt
    | WHILE '(' expr ')' stmt           #whileStmt
    | THROW expr SEMI                   #throwStmt
    | TRY stmt CATCH '(' IDENT ')' stmt #tryCatchStmt
    ;

// Expressions
expr
    : IDENT                              #varExpr
    | NUM                                #numLitExpr
    | BOOLEAN                            #booleanLitExpr
    | '(' expr ')'                       #parensExpr
    | functionDeclExpr                   #functionDeclExprRule
    | RAISE '(' expr ')'                 #raiseExpr
    | expr '(' (expr (COMMA expr)*)? ')' #functionCallExpr
    | op = (PLUS | MINUS | NOT) expr     #unaryExpr
    | expr opm expr                      #binExpr
    | expr opa expr                      #binExpr
    | expr opc expr                      #binExpr
    | expr opb expr                      #binExpr
    ;

functionDeclExpr
    : '(' paramList? ')' ARROW functionBody
    ;

functionBody
    : '{' stmt* '}'
    | expr
    ;

paramList
    : IDENT (COMMA IDENT)*
    ;

// Operators for arithmetic with multiplication priority
opm 
    : MUL                           #mul
    | DIV                           #div
    ;

// Operators for arithmetic with addition priority
opa 
    : PLUS                          #plus
    | MINUS                         #minus
    ;

// Operators for boolean expressions
opb 
    : AND                           #and
    | OR                            #or
    ;

// Comparison operators
opc 
    : LT                            #lt
    | LEQ                           #leq
    | EQ                            #eq
    | NEQ                           #neq
    | GT                            #gt
    | GEQ                           #geq
    ;

// Lexer rules

// Keywords
BOOLEAN : TRUE | FALSE;
SKIPP   : 'skip';
IF      : 'if';
THEN    : 'then';
ELSE    : 'else';
WHILE   : 'while';
DO      : 'do';
TRUE    : 'true';
FALSE   : 'false';
NOT     : 'not';
AND     : 'and';
OR      : 'or';
RETURN  : 'return';
THROW   : 'throw';
TRY     : 'try';
CATCH   : 'catch';

// Intrinsics
RAISE   : 'raise';

// Operators and punctuation
ASSIGN  : '=';
SEMI    : ';';
PLUS    : '+';
MINUS   : '-';
MUL     : '*' ;
DIV     : '/' ;
LT      : '<' ;
LEQ     : '<=' ;
EQ      : '==' ;
NEQ     : '!=' ;
GT      : '>' ;
GEQ     : '>=' ;
COMMA   : ',' ;
ARROW   : '=>' ;

// Identifiers and numbers
IDENT   : [a-zA-Z]+ ;
NUM     : ([0-9]*[.])?[0-9]+ ;

// Comments (Python style)
// Skip from '#' to the end of line.
LINE_COMMENT : '#' ~[\r\n]* -> skip ;

// Skip whitespace and newline characters.
WS      : [ \t\r\n]+ -> skip ;
