
const history_1 = document.getElementById('history1');
const history_2 = document.getElementById('history2');
const history_3 = document.getElementById('history3');
const section = document.querySelector('section');

history_1.addEventListener('click', function() {
    section.style.left = 0;
})

history_1.addEventListener('blur', function() {
    section.style.left='-600px';
})

history_2.addEventListener('click', function() {
    section.style.left = 0;
})

history_2.addEventListener('blur', function() {
    section.style.left='-600px';
})

history_3.addEventListener('click', function() {
    section.style.left = 0;
})

history_3.addEventListener('blur', function() {
    section.style.left='-600px';
})