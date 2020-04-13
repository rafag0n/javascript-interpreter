
let type = {
    INTEGER: 'int',
    MUL:'mul',
    DIV:'div',
    PLUS:'plus',
    MINUS:'minus',
    LPAREN:'lparen',
    RPAREN:'rparen',
    EOF:'eof',
    ID: 'id',
    SEMI: ';',
    ASSIGN: '=',
    DOT:'.',
    EXCL: '!',
    NEWLINE: '\n',
    DOT: '.'
}


let keywords = {
    let: 'let',
    const: 'const',
    function: 'function',
    var: 'var',
    this: 'this',
    function: 'function',
    constructor: 'constructor'
}

function Token(value, type){
    this.value = value;
    this.type = type
}



class Lexer{
    constructor(text){
        //should create tokens
        this.text = text
        this.pos = 0
        this.currentChar = text[this.pos]
    }

    advance = () =>{
        this.pos+=1
        if (this.pos > this.text.length - 1){
            this.currentChar = null;
        } else {
            this.currentChar = this.text[this.pos]
        }
    }

    isAlphanumeric = (value) => {
        return RegExp("^[0-9a-z]+$").test(value)
    }

    isInteger = (value) =>{
        return (value != null && !isNaN(value))
    }

    getIntegerToken = () =>{
        let finalInt = ''
    
        while (this.currentChar != ' ' && this.isInteger(this.currentChar)){
            finalInt = finalInt + this.currentChar
            this.advance()
        }
        return parseInt(finalInt)
    }

    verifyReservedKeywords = (value) =>{
        if (keywords[value]!=null) {
            return true
        } return false
    }

    getIdToken = () => {
        let result = ''
        while (this.currentChar != null && this.isAlphanumeric(this.currentChar)){
            result += this.currentChar;
            this.advance()
        }
        let token = this.verifyReservedKeywords(result) ? new Token(result, keywords[result]) : new Token(result, type.ID)
        return token
    }

    skipWhitespace = () =>{
        while (this.currentChar==' '){
            this.advance()
        }
    }
    
    peek = () => {
        if (this.pos +1 < this.text.length - 1) {
            return null
        } else {
            return this.text[this.pos + 1]
        }
    }

    getNextToken = () => {

        while (this.currentChar!=null){
            
            if (this.currentChar == ' '){
                this.skipWhitespace()
            }

            if (this.isInteger(this.currentChar)){
                return new Token(this.getIntegerToken(), type.INTEGER)
            }

            if (this.isAlphanumeric(this.currentChar)){
                return this.getIdToken()
            }

            if (this.currentChar == '=' && this.peek() != '=') {
                this.advance()
                return new Token('=', type.ASSIGN)
            }

            

            if (this.currentChar == ';'){
                this.advance()
                return new Token(';', type.SEMI)
            }

            if (this.currentChar == "\n") {
                this.advance()
                return new Token("\n", type.NEWLINE)
            }

            if (this.currentChar == '+'){
                this.advance()
                return new Token('+', type.PLUS)
            }

            if (this.currentChar == '-'){
                this.advance()
                return new Token('-', type.MINUS)

            }

            if (this.currentChar == '('){
                this.advance()
                return new Token('(', type.LPAREN)
            }

            
            if (this.currentChar == ')'){
                this.advance()
                return new Token(')', type.RPAREN)
            }

            if (this.currentChar == '*'){
                this.advance()
                return new Token('*', type.MUL)
            }

            if (this.currentChar == '/'){
                this.advance()
                return new Token('/', type.DIV)
            }

            throw new Error('Invalid character')
        }

        return new Token(null, type.EOF)
    }

}

function BinaryOperator(left,right,op){
    this.left = left;
    this.token = op;
    this.right = right;
    this.op =op
}

function Num (token){
    this.token = token;
    this.value = token.value
}

function UnaryOperator(token, factor){
    this.token = token;
    this.factor = factor;
}

function Compound(){
    this.children = []
}

function NoOperation(){
    return null
}

function Variable(token){
    this.value = token.value
    this.token = token
}

function Assign(left,right,op){
    this.left = left
    this.op = op
    this.right = right
    this.token = op
}



class Parser{
    constructor(lexer){
        //should return an AST
        this.lexer = lexer
        this.currentToken = this.lexer.getNextToken()
        
    }


    eat = (type) =>{
        if (this.currentToken.type == type){
            this.currentToken = this.lexer.getNextToken();
        } else {
            throw new Error('Syntax error')
        }
    }


    compoundExpression = () => {
        let nodes = this.statementList()
       
        let root = new Compound()
        nodes.forEach((node)=>root.children.push(node))
        return root
    }

    assignmentStatement = (assignmentType) => {
        this.eat(assignmentType)
        let left = this.variable()
        let token = this.currentToken
        this.eat(type.ASSIGN)
        let right = this.expr()
        let node = new Assign(left, right, token)
        return node
    }

    statement = () => {
        let node;
        if (this.currentToken.type == keywords.var ) {
            node = this.assignmentStatement(keywords.var)
        } else if (this.currentToken.type == keywords.let ) {
            node = this.assignmentStatement(keywords.let)
        } else if (this.currentToken.type == keywords.const ) {
            node = this.assignmentStatement(keywords.const)
        } else {
            node = this.expr()
        }
        return node;
    }

    statementList = () => {
        let node = this.statement() 
        let results = [node];


        while (this.currentToken.type == type.SEMI){
            this.eat(type.SEMI)
            results.push(this.statement())
        } 

        if (this.currentToken.type == type.ID){
            throw new Error('Wrong syntax! Unexpected Id')
        }

        return results;
    }

    variable = () =>{
        let node = new Variable(this.currentToken);
        this.eat(type.ID)
        return node;
    }


    empty = () => {
        return NoOperation()
    }



    factor = () => {
        
        let token = this.currentToken
        if (this.currentToken.type == type.INTEGER){
            this.eat(type.INTEGER)
            return new Num(token)
        } else if (this.currentToken.type == type.PLUS){
            this.eat(type.PLUS)
            return new UnaryOperator(token, this.factor())
        } else if (this.currentToken.type == type.MINUS){
            this.eat(type.MINUS)
            return new UnaryOperator(token, this.factor())
        } else if (this.currentToken.type == type.LPAREN){
            this.eat(type.LPAREN)
            let node = this.expr()
            this.eat(type.RPAREN)
            return node;
        } else {
            let node = this.variable();
            return node
        }
    }

    term = () => {

        let node = this.factor();
        let termTypes = [type.MUL, type.DIV]
        while (termTypes.includes(this.currentToken.type)){
            let token = this.currentToken;
            if (token.type == type.MUL){
                this.eat(type.MUL)
            } if (token.type == type.DIV){
                this.eat(type.DIV)
            }
            new BinaryOperator()
            node = new BinaryOperator(node, this.factor(),token)
        }
        return node
    }


    expr = () => {

        let node = this.term();
        let exprTypes = [type.PLUS, type.MINUS]
        while (exprTypes.includes(this.currentToken.type)){
            let token = this.currentToken;
            if (token.type == type.PLUS) {
                this.eat(type.PLUS)
            } if (token.type == type.MINUS) {
                this.eat(type.MINUS)
            }
            node = new BinaryOperator(node, this.term(),token) 
        }

        return node
    }

    parse = () => {
        let root =  this.compoundExpression();
        return root;
    }

}




class Interpreter{
    constructor(parser){
        //should traverse a tree produced by the parser returning a value
        this.parser = parser;
        this.globalScope = {}
    }

    visit = (node) => {
        let name = node.constructor.name

        if (name == 'BinaryOperator'){
            return this.visitBinaryOperator(node)
        } if (name == 'UnaryOperator') {
            return this.visitUnaryOperator(node)
        } if (name == 'Num') {
            return this.visitNumber(node)
        } if (name == 'Compound'){
            return this.visitCompound(node)
        } if (name == 'Variable'){
            return this.visitVar(node)
        } if (name == 'Assign'){
            return this.visitAssign(node)
        } if (name == 'NoOp'){
            return this.visitNoOp(node)
        }
    }

    visitCompound = (node) => {
        node.children.forEach(node=>{
            this.visit(node);
        })
    }

    visitAssign = (node) => {
        let varName = node.left.value;
        this.globalScope[varName] = this.visit(node.right)
    }

    visitVar = (node) => {
        let varName = node.value;
        let value = this.globalScope[varName]
        if (value==null){
            throw new Error('Undefined variable!')
        } else {
            return value
        }
    }

    visitNoOp = (node) => {
        return;
    }

    visitUnaryOperator = (node)=>{
        switch (node.token.type){
            case type.PLUS:
                return +this.visit(node.factor)
            case type.MINUS:
                return -this.visit(node.factor)
        }
    }   

    visitBinaryOperator = (node) => {
        switch (node.token.type) {
            case type.PLUS:
                return this.visit(node.left)+this.visit(node.right)
            case type.MINUS:
                return this.visit(node.left)-this.visit(node.right)
            case type.MUL:
                return this.visit(node.left)*this.visit(node.right)
            case type.DIV:
                return this.visit(node.left)/this.visit(node.right)
        }
    }

    visitNumber = (node) => {
        return parseInt(node.value)
    }

    interpret = () => {
        const tree = this.parser.parse()
        this.visit(tree)
        console.log(this)
    }


}



function prompt(){

    var standard_input = process.stdin;
    standard_input.setEncoding('utf-8');
    console.log("Please input the calculations");
    standard_input.on('data', function (data) {
        
        if(data == 'exit\n'){
            console.log("User input complete, program exit.");
            process.exit();
        }else {   
            console.log('User Input Data : ' + data);
            let lexer = new Lexer(data)
            let parser = new Parser(lexer)
            let interpreter = new Interpreter(parser)
            interpreter.interpret()
        }
    });

}

prompt()
