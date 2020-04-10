
let type = {
    INTEGER: 'int',
    MUL:'mul',
    DIV:'div',
    PLUS:'plus',
    MINUS:'minus',
    LPAREN:'lparen',
    RPAREN:'rparen',
    EOF:'eof'
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

    skipWhitespace = () =>{
        while (this.currentChar==' '){
            this.skipWhitespace()
            this.advance()
        }
    }

    getNextToken = () => {

        while (this.currentChar!=null){

            if (this.isInteger(this.currentChar)){
                return new Token(this.getIntegerToken(), type.INTEGER)
            }

            if (this.currentChar == ' '){
                this.skipWhitespace()
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

function Num(token){
    this.token = token;
    this.value = token.value
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

    factor = () => {
        
        let token = this.currentToken
        if (this.currentToken.type == type.INTEGER){
            this.eat(type.INTEGER)
            return new Num(token)
        } 
        if (this.currentToken.type == type.LPAREN){
            this.eat(type.LPAREN)
            let node = this.expr()
            this.eat(type.RPAREN)
            return node;
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
        let tree =  this.expr()
        return tree
    }

}




class Interpreter{
    constructor(parser){
        //should traverse a tree produced by the parser returning a value
        this.parser = parser;
    }

    visit = (node) => {
        
        if (node.op != null){
            return this.visitBinaryOperator(node)
        } else {
            return this.visitNumber(node)
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
        return this.visit(tree)
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
            console.log(interpreter.interpret())
        }
    });

}

prompt()
