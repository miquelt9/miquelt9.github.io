function getTrainSmoke(id, n) {
    if (id == 0) return addWhitespace(smoke1, n);
    if (id == 1) return addWhitespace(smoke1, n);
    if (id == 2) return addWhitespace(smoke2, n);
    if (id == 3) return addWhitespace(smoke2, n);
}

function getTrainBody(n) {
    return addWhitespace(train, n);
}

function getTrainWheels(id, n) {
    if (id == 0) return addWhitespace(wheels1, n);
    if (id == 1) return addWhitespace(wheels2, n);
    if (id == 2) return addWhitespace(wheels3, n);
    if (id == 3) return addWhitespace(wheels4, n);
    if (id == 4) return addWhitespace(wheels5, n);
    if (id == 5) return addWhitespace(wheels6, n);
}

function addWhitespace(figure, n) {
    const lines = figure.split('\n');
    const modifiedLines = lines.map(line => {
      if (n > 0) {
        const whitespace = ' '.repeat(n);
        return whitespace + line;
      } else if (n < 0) {
        return line.slice(-n);
      } else {
        return line;
      }
    });
    return modifiedLines.join('\n');
}

let smoke1 = 
`                (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O           
            (@@@)                                                                     
        (    )                                                                        
    (@@@@)                                                                            
                                                                                      
(   )                                                                                 `

let smoke2 = 
`                (@@) (  ) (@)  ( )  @@    ()    @     O     @     O      @          
            (   )                                                                    
        (@@@@)                                                                       
    (    )                                                                           
                                                                                     
(@@@)                                                                                `

let train = `
    ====        ________                ___________
_D _|  |_______/        \\__I_I_____===__|_________|
 |(_)---  |   H\\________/ |   |        =|___ ___|      _________________
 /     |  |   H  |  |     |   |         ||_| |_||     _|                \\_____A
|      |  |   H  |__--------------------| [___] |   =|                        |
| ________|___H__/__|_____/[][]~\\_______|       |   -|                        |
|/ |   |-----------I_____I [][] []  D   |=======|____|________________________|_`

let wheels6 = `
__/ =| o |=-~O=====O=====O=====O\\ ____Y___________|__|__________________________|_
|/ -=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|
 \\__/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/
`
let wheels5 = `
__/ =| o |=-O=====O=====O=====O \\ ____Y___________|__|__________________________|_
|/ -=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|
 \\__/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/
`

let wheels4 = `
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_
|/ -=|___|=O=====O=====O=====O   |_____/~\\___/          |_D__D__D_|  |_D__D__D_|
 \\__/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/
`

let wheels3 = `
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_
|/ -=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|
 \\__/      \\O=====O=====O=====O_/      \\_/               \\_/   \\_/    \\_/   \\_/
`

let wheels2 = `
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_
|/ -=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|
 \\__/      \\_O=====O=====O=====O/      \\_/               \\_/   \\_/    \\_/   \\_/
`

let wheels1 = `
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_
|/ -=|___|=   O=====O=====O=====O|_____/~\\___/          |_D__D__D_|  |_D__D__D_|
 \\__/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/
`