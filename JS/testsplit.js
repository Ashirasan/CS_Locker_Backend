
const input_password = "*12*442345"
var locker_num = "", password = "";
var count_star = 0;

for(let i=0;i<input_password.length;i++){
    if(input_password[i] === "*") count_star++;
    else if(count_star === 1) locker_num += input_password[i];
    else if(count_star === 2) password += input_password[i];
}

console.log(locker_num);
console.log(password);

