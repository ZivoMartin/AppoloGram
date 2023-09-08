const { Client } = require('pg');
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.set ('views', './ejs-templates');
const host = 'localhost';
const port = 8080;

const client = new Client({
    user: 'postgres',
    password: 'Azerty1.',
    database: 'appologram', 
    port : 5432
});
client.connect()
.then(() => {
    console.log('Connected to database');
})
.catch((e) => {
    console.log('Error connecting to database');
    console.log(e);
});





app.use('/public', express.static('public'));

app.get('/index', (req, res)=>{
    res.redirect('/public/index.html');
})

app.get('/', (req, res)=>{
    res.redirect('/public/index.html');
})

app.get('/inscription', (req, res)=>{
    res.redirect('/public/inscription.html');
})

app.get('/connexion', (req, res)=>{
    res.redirect('/public/connexion.html');
})

app.get('/', (req, res)=>{
    res.redirect('/public/index.html');
})

app.post("/mur/connexion", (req, res)=>{
    let donnees;
    req.on("data", (datachunk)=>{
        donnees += datachunk.toString();
    })
    req.on("end", async ()=>{
        user = donnees.split("&")[0].split("=")[1];
        result = await client.query("SELECT * FROM utilisateur WHERE pseudo='"+user+"' AND passw='"+donnees.split("&")[1].split("=")[1]+"'");
        if(result.rows[0]==null){
            res.redirect("/public/ConnexionEchec.html");
        }else{
            res.redirect("/mur/"+user);
        }
    })    
})

app.post("/mur/inscription", async (req, res)=>{
    let donnees;
    req.on("data", (datachunk)=>{
        donnees += datachunk.toString();
    })
    req.on("end", async ()=>{
        user = donnees.split("&")[0].split("=")[1];
        result = await client.query("SELECT * FROM utilisateur WHERE pseudo='"+user+"'");
        if(result.rows[0]==null){
            client.query("INSERT INTO utilisateur (pseudo, passw) VALUES ('"+user+"', '"+donnees.split("&")[1].split("=")[1]+"')");
            res.redirect("/public/InscriptionValid.html");
        }else{
            res.redirect("/public/InscriptionEchec.html");
        }
    })
})

app.get("/mur/:user", async (req, res)=>{
    user = req.params.user;
    result = await client.query("SELECT followed from follow WHERE follower='"+user+"'");
    const follow = result.rows.map(row=>row.followed);
    const file_path = [];
    const pseudos = [];
    const pdp = [];
    const nb_likes = [];
    const liked = [];
    const id = [];
    const commentaires = [];
    result = await client.query("SELECT file_path_pdp FROM utilisateur WHERE pseudo='"+user+"'");
    const pdp_user = result.rows[0].file_path_pdp;
    if(follow[0] != null){
        var k = 0;
        for(i = 0; i<follow.length; i = i + 1){
            result = await client.query("SELECT id FROM images WHERE pseudo='"+follow[i]+"'");
            const images = result.rows.map(row=>row.id);
            for(j = 0; j<images.length; j = j + 1){
                id[k] = images[j];
                k = k + 1;
            }
        }
        const taille = id.length;
        for(i = 0; i<taille; i = i + 1){
            if(i!=taille-1){
                for(j = i + 1; j < taille; j = j + 1){
                    if(id[i]<id[j]){
                        temp = id[i];
                        id[i] = id[j];
                        id[j] = temp;
                    }
                }
            }
            result = await client.query("SELECT file_path FROM images WHERE id="+id[i]);
            file_path[i] = result.rows[0].file_path;
            result = await client.query("SELECT pseudo FROM images WHERE id="+id[i]);
            pseudos[i] = result.rows[0].pseudo;
            result = await client.query("SELECT file_path_pdp FROM utilisateur WHERE pseudo='"+pseudos[i]+"'");
            pdp[i] = result.rows[0].file_path_pdp;
            result = await client.query("SELECT nb_likes FROM images WHERE id="+id[i]);
            nb_likes[i] = result.rows[0].nb_likes;
            result = await client.query("SELECT * FROM likes WHERE pseudo='"+user+"' AND id_image="+id[i]);
            if(result.rows[0] == null){
                liked[i] = true;
            }else{
                liked[i] = false;
            }                    
            
            result = await client.query("SELECT texte FROM commentaires WHERE id_image="+id[i]);
            if(result.rows[0] != null){
                comments = result.rows.map(rows=>rows.texte);
                commentaires[i] = [];
                for(k = 0; k<comments.length; k+=1){
                    result = await client.query("SELECT pseudo FROM commentaires WHERE texte ='"+comments[k]+"'");
                    commentaires[i][k] = result.rows[0].pseudo+" : "+comments[k];
                }
               
            }
        }
       
    }
    res.render('mur', {user: user,file_path: file_path, pseudos: pseudos, pdp: pdp, nb_likes: nb_likes, liked: liked,  id: id, commentaires: commentaires, follow: follow, pdp_user: pdp_user});
})

app.get("/like/:signe/:id/:pseudo", async (req, res)=>{
    id = req.params.id
    if(req.params.signe == '+'){
        client.query("INSERT INTO likes (id_image, pseudo) VALUES ("+id+", '"+req.params.pseudo+"')")
        client.query("UPDATE images SET nb_likes = nb_likes + 1 WHERE id="+id)
    }else{
        client.query("DELETE FROM likes WHERE id_image="+id)
        client.query("UPDATE images SET nb_likes = nb_likes - 1 WHERE id="+id)
    }
})

app.get("/commentaire/:com/:id_image/:pseudo", (req, res)=>{
    com = req.params.com
    if(com != ""){
        client.query("INSERT INTO commentaires (texte, id_image, pseudo) VALUES ('"+com+"', "+ req.params.id_image+", '"+req.params.pseudo+"')")
    }
})

app.get("/get_comment/:num/:stop", async (req, res)=>{
    const id = req.params.num;
    const stop = req.params.stop;
    result = await client.query("SELECT pseudo, texte FROM commentaires WHERE id_image = "+id)
    com = result.rows.map(row=>row.texte)
    pseudos = result.rows.map(row=>row.pseudo)
    var data = {}
    for(i = com.length - 1; i >= stop; i--){
        data["comm"+i] = com[i]
        data["pseudo"+i] = pseudos[i]
    }
    res.json(data) 
})

app.get("/delete/:user", (req, res)=>{
    user = req.params.user
    client.query("DELETE FROM follow WHERE follower='"+user+"' OR followed='"+user+"'")
    client.query("DELETE FROM images WHERE pseudo='"+user+"'")
    client.query("DELETE FROM likes WHERE pseudo='"+user+"'")
    client.query("DELETE FROM commentaires WHERE pseudo='"+user+"'")
    client.query("DELETE FROM conversations WHERE user1='"+user+"' OR user2='"+user+"'")
    client.query("DELETE FROM messages WHERE envoyeur='"+user+"' OR receveur='"+user+"'")
    client.query("DELETE FROM utilisateur WHERE pseudo='"+user+"'")
    res.redirect("/public/index.html")
})

app.get("/my_pr/:user", async (req, res)=>{
    const user = req.params.user;
    result = await client.query("SELECT file_path_pdp FROM utilisateur WHERE pseudo='"+user+"'");
    pdp_user = result.rows[0].file_path_pdp;
    result = await client.query("SELECT follower FROM follow WHERE followed='"+user+"'");
    tab_follower = result.rows.map(row=>row.follower);
    result = await client.query("SELECT followed FROM follow WHERE follower='"+user+"'");
    tab_followed = result.rows.map(row=>row.followed);
    result = await client.query("SELECT file_path, nb_likes, id FROM images WHERE pseudo='"+user+"'")
    nb_likes = result.rows.map(row => row.nb_likes)
    images_tab = result.rows.map(row => row.file_path)
    id = result.rows.map(row=>row.id)
    res.render('profil_user', {user: user, visiteur: user, pdp_user: pdp_user, followers: tab_follower, followed: tab_followed, images: images_tab, nb_likes: nb_likes, id: id, my_pr: true})
})

app.get("/pr/:pr_user/:user", async (req, res)=>{
    pr_user = req.params.pr_user
    user = req.params.user
    result = await client.query("SELECT file_path_pdp FROM utilisateur WHERE pseudo='"+pr_user+"'");
    pdp_user = result.rows[0].file_path_pdp;
    result = await client.query("SELECT follower FROM follow WHERE followed='"+pr_user+"'");
    tab_follower = result.rows.map(row=>row.follower);
    result = await client.query("SELECT followed FROM follow WHERE follower='"+pr_user+"'");
    tab_followed = result.rows.map(row=>row.followed);
    result = await client.query("SELECT file_path, nb_likes, id FROM images WHERE pseudo='"+pr_user+"'")
    nb_likes = result.rows.map(row => row.nb_likes)
    images_tab = result.rows.map(row => row.file_path)
    id = result.rows.map(row=>row.id)
    res.render('profil_user', {user: pr_user, visiteur: user, pdp_user: pdp_user, followers: tab_follower, followed: tab_followed, images: images_tab, nb_likes: nb_likes, id: id, my_pr: false})
})


app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});


