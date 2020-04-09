
const types = {
    INTEGER: 'integer',
    PLUS: 'plus',
    MINUS: 'minus',
    EOF: 'eof'
}


class token {
    constructor(value, type){
        this.value = value;
        this.type = type;
    }
}


class Interpreter{
    constructor(text){
        this.text = text; 
        this.pos = 0;
        this.currentToken = null;
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
        return new token(result, types.INTEGER)
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

    getNextToken = () => {
        
        
        while (this.currentCharacter != null){

            if (this.currentCharacter == ' '){
                this.skipWhitespaces()
            }
            
            if (this.isInteger(this.currentCharacter)){
                return this.integer()
            }

            if (this.currentCharacter == '+'){
                this.advance()
                return new token('+', types.PLUS)
            }

            if (this.currentCharacter == '-'){
                this.advance()
                return new token('+', types.MINUS)
            }

            throw new Error('Couldnt parse')
        }

        return new token(null, types.EOF)
    }


    eat = (desiredTypes) => {
        if (this.currentToken != null && desiredTypes.includes(this.currentToken.type)) {
            this.currentToken = this.getNextToken()
        } else {
            throw new Error('Syntax error');
        }
    }


    performOperation = (left, right, op) => {
        switch (op.type) {
            case types.MINUS:
                return parseInt(left.value) - parseInt(right.value)
            case types.PLUS:
                return parseInt(left.value) + parseInt(right.value)
            default: 
                break
        }
    }


    expr = () => {
        
        this.currentToken = this.getNextToken();
        let result = null

        
        while (this.currentToken.type != types.EOF) {


            let left = result
            if (left == null){
                left = this.currentToken
                this.eat([types.INTEGER])
            }

            let op = this.currentToken
            this.eat([types.MINUS, types.PLUS])
            
            let right = this.currentToken
            this.eat([types.INTEGER])

            let value = this.performOperation(left, right, op)
            result = new token(value, types.INTEGER)
        }

        return result.value

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
            let interpreter = new Interpreter(data)
            console.log(interpreter.expr())
        }
    });

}

prompt()