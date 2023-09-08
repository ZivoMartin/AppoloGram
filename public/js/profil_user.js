boutons = Array.from(document.getElementsByClassName('com_button'));

boutons.forEach(element => {
    element.addEventListener('click', ()=>{
        element.remove()
        const id = element.id.split("/")[0]
        const i = element.id.split("/")[1]
        fetch("/get_comment/"+id+"/0")
            .then(first_rep => first_rep.json())
            .then(response => {
                const size = Object.keys(response).length;
                for(k = 0; k < (size/2); k++){
                    div = document.getElementById('ensemble_'+i)
                    txt = document.createElement("p");
                    txt.textContent = response["pseudo"+k] + " : " +response["comm"+k];
                    div.appendChild(txt);
                }
            })
    })
});