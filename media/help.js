
const btn = document.querySelector('.help-btt');
const section = document.querySelector('section');

btn.addEventListener('click', function() {
    section.style.left = 0;
    label.style.opacity = 0;
})

btn.addEventListener('blur', function() {
    section.style.left='-600px';
    label.style.opacity = 1
})