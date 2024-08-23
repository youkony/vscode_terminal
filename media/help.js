
const help = document.getElementById('help');
const section = document.querySelector('section');

help.addEventListener('click', function() {
    section.style.left = 0;
})

help.addEventListener('blur', function() {
    section.style.left='-600px';
})
