
const tool = document.getElementById('Tool');
const section = document.querySelector('section');
const apply = document.getElementById("Apply");
const cancel = document.getElementById("Cancel");

const chk_hilight_en = document.getElementById('hilight_en');
const input_hilight_red = document.getElementById('hilight_red');
const input_hilight_green = document.getElementById('hilight_green');
const input_hilight_yellow = document.getElementById('hilight_yellow');

tool.addEventListener('click', function() {
    section.style.left = 0;
})

cancel.addEventListener('click', function() {
    section.style.left ='-600px';
})

apply.addEventListener('click', function() {
    hilight_en = chk_hilight_en.checked;
    hilight_red = input_hilight_red.value;
    hilight_green = input_hilight_green.value;
    hilight_yellow = input_hilight_yellow.value;

    regExp_red = new RegExp(`(${hilight_red})`, 'g');
    regExp_green = new RegExp(`(${hilight_green})`, 'g');
    regExp_yellow = new RegExp(`(${hilight_yellow})`, 'g');

    section.style.left='-600px';
})

