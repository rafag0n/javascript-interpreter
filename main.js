

const types = {
    INTEGER: 'integer',
    PLUS: 'plus',
    MINUS: 'minus',
    EOF: 'eof',
    MUL: 'mul',
    DIV: 'div',
    LPAREN: '(',
    RPAREN: ')'
}


class token {
    constructor(value, type){
        this.value = value;
        this.type = type;
    }
}


class Lexer{
    constructor(text){
        this.text = text; 
        this.pos = 0;
        this.currentCharacter = this.text[this.pos];
    }

    skipWhitespaces = () => {
        while (this.currentCharacter == ' '){
            this.advance()
        }
    }

    
    integer = () => {
        let result = ''
        while (this.isInteger(this.currentCharacter)) {
            result += this.currentCharacter
            this.advance()
        }
        return result
    }

    advance = () => {
        
        this.pos += 1;
        if (this.pos < this.text.length - 1){
            this.currentCharacter = this.text[this.pos]
        } else {
            this.currentCharacter = null;
        }
        
    }

    isInteger = (value) => {
        return !isNaN(value) && value != null
    }

    factor = () => {
        let token = this.currentToken
        this.eat(types.INTEGER)
        return token.value
    }

    getNextToken = () => {
        
        
        while (this.currentCharacter != null){

            if (this.currentCharacter == ' '){
                this.skipWhitespaces()
            }
            
            if (this.isInteger(this.currentCharacter)){
                return new token(this.integer(), types.INTEGER)
            }

            if (this.currentCharacter == '+'){
                this.advance()
                return new token('+', types.PLUS)
            }

            if (this.currentCharacter == '-'){
                this.advance()
                return new token('+', types.MINUS)
            }

            if (this.currentCharacter == '/'){
                this.advance()
                return new token('/', types.DIV)
            }

            
            if (this.currentCharacter == '*'){
                this.advance()
                return new token('/', types.MUL)
            }

            if (this.currentCharacter == '('){
                this.advance()
                return new token('(', types.LPAREN)
            }

            if (this.currentCharacter == ')'){
                this.advance()
                return new token(')', types.RPAREN)
            }

            throw new Error('Couldnt parse')
        }

        return new token(null, types.EOF)
    }


}


class Interpreter {
    constructor(lexer){
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken()
    }


    eat = (desiredType) => {
        if (this.currentToken != null && desiredType == this.currentToken.type) {
            this.currentToken = this.lexer.getNextToken()
        } else {
            throw new Error('Syntax error');
        }
    }


    factor = () => {
        let token = this.currentToken
        switch (token.type) {
            case types.INTEGER:
                this.eat(types.INTEGER);
                return token.value
            case types.LPAREN:
                this.eat(types.LPAREN)
                let result = this.expr()
                this.eat(types.RPAREN)
                return result

        }
        
    }

    term = () => {

        let result = this.factor()
        while ([types.MUL,types.DIV].includes(this.currentToken.type)) {

            let token = this.currentToken
            switch (token.type){
                case types.MUL:
                    this.eat(types.MUL)
                    result = parseInt(result) * parseInt(this.factor())
                    break
                case types.DIV:
                    this.eat(types.DIV)
                    result = parseInt(result) / parseInt(this.factor())
                    break
                default:
                    break
            }
        }

        return result

    }

    expr = () => {
        
        
        let result = this.term()
        while ([types.PLUS,types.MINUS].includes(this.currentToken.type)) {

            let token = this.currentToken
            switch (token.type){
                case types.PLUS:
                    this.eat(types.PLUS);
                    result = parseInt(result) + parseInt(this.term())
                    break
                case types.MINUS:
                    this.eat(types.MINUS);
                    result = parseInt(result) - parseInt(this.term())
                    break
                default:
                    break
            }
        }

        return result

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
            let interpreter = new Interpreter(lexer)
            console.log(interpreter.expr())
        }
    });

}

prompt()