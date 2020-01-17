import './index.css'
export function index() {
    var array = ['1','2','3','4'];
    array.forEach(item =>{
        console.log(item)
    })
    var div = document.createElement('div');
    div.className = 'index-div-bg';
    document.body.appendChild(div);
}
