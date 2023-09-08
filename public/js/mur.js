button_like = Array.from(document.getElementsByClassName('button_like'));
img_button = document.getElementsByClassName('pouce');
nb_likes = document.getElementsByClassName('nb_like');
forms = document.getElementsByClassName('formulaires');

button_like.forEach(element => {
    element.addEventListener('click', ()=>{
        const i = parseInt(element.id.replace("button_like", ""));
        const id = img_button[i].id.replace("pouce", "");
        if(img_button[i].src.endsWith('pouceBleu.jpg')){
            img_button[i].src = '/public/photos/pouceGris.jpg';
            nb_likes[i].textContent = parseInt(nb_likes[i].textContent) - 1;
            fetch("/like/-/"+id+"/"+nb_likes[i].id);
        }else{
            nb_likes[i].textContent = parseInt(nb_likes[i].textContent) + 1;
            img_button[i].src = '/public/photos/pouceBleu.jpg';
            fetch("/like/+/"+id+"/"+nb_likes[i].id);

        }
    })
});

forms = document.querySelectorAll('Form');
input = document.getElementsByClassName("comment_input");
papadivs = document.getElementsByClassName('bloc_image');
size = [];
for(i = 0; i<papadivs.length; i++){
    comments = Array.from(document.getElementsByClassName("comms"+i));
    size[i] = comments.length;
}
forms.forEach(element=>{
    element.addEventListener('submit', function(event){;
        event.preventDefault();
        const i = parseInt(element.id.replace("form", ""));
        const id = img_button[i].id.replace("pouce", "");
        const user = nb_likes[i].id;
        var formData = new FormData(event.target);
        var commentaire = formData.get("commentaire");
        input[i].value = "";
        size[i] += 1;
        if(commentaire != ""){
            txt = document.createElement("p");
            txt.textContent = user + ' : ' + commentaire;
            txt.class = "comms"+i;
            txt.id = "comment_img_"+i+"_number_"+comments.length;
            papadivs[i].appendChild(txt);
            fetch("/commentaire/"+commentaire +"/" + id + "/" + user);

        }
    })
})
   
see_more = Array.from(document.getElementsByClassName("see_more"));

see_more.forEach(element =>{
    element.addEventListener('click', ()=>{
        const id = element.id.split("/")[0].replace("see_more", "");
        const i = element.id.split("/")[1];
        element.remove();
        fetch("/get_comment/"+id+"/4")
            .then(first_rep => first_rep.json())
            .then(response => {
                const size = Object.keys(response).length;
                for(k = 4; k < (size/2)+4; k++){
                    txt = document.createElement("p");
                    txt.textContent = response["pseudo"+k] + " : " +response["comm"+k];
                    papadivs[i].appendChild(txt);
                }
            })
        
    })
})
