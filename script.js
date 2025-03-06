let prompt=document.querySelector("#prompt")
let submitbtn=document.querySelector("#submit")
let chatContainer=document.querySelector(".chat-container")
let imagebtn=document.querySelector("#image")
let image=document.querySelector("#image img")
let imageinput=document.querySelector("#image input")

const Api_Url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBo3T4eKrSp6uFIUE8UPWHxwP0qA_6iZZg"

// Farming-related keywords to validate queries
const farmingKeywords = [
    'crop', 'plant', 'farm', 'agriculture', 'soil', 'fertilizer', 'pesticide', 
    'harvest', 'seeds', 'irrigation', 'weather', 'disease', 'pest', 'farmer',
    'field', 'grow', 'yield', 'organic', 'farming', 'agricultural'
];

let user={
    message:null,
    file:{
        mime_type:null,
        data: null
    }
}
 
// Function to check if the query is farming-related
function isFarmingRelated(query) {
    const lowercaseQuery = query.toLowerCase();
    return farmingKeywords.some(keyword => lowercaseQuery.includes(keyword));
}

// Add farming-specific context to the prompt
function enhancePrompt(userMessage) {
    const farmingContext = `You are an expert farming assistant. Please provide detailed agricultural advice based on the following query. If an image is provided, analyze the crop condition and provide specific recommendations. Focus on: 1) Crop health assessment 2) Disease identification (if any) 3) Treatment recommendations 4) Best farming practices 5) Weather considerations. Query: ${userMessage}`
    return farmingContext;
}

async function generateResponse(aiChatBox) {
    let text=aiChatBox.querySelector(".ai-chat-area")
    
    // Check if the query is farming-related
    if (!isFarmingRelated(user.message)) {
        text.innerHTML = "I apologize, but I can only assist with farming and agricultural-related queries. Please ask questions about crops, farming practices, agricultural issues, or upload crop images for analysis. For example, you can ask about crop diseases, farming techniques, weather impact on crops, or best practices for specific crops."
        return;
    }

    let RequestOption={
        method:"POST",
        headers:{'Content-Type' : 'application/json'},
        body:JSON.stringify({
            "contents":[
                {"parts":[{text:enhancePrompt(user.message)},(user.file.data?[{inline_data:user.file}]:[])
                ]
            }]
        })
    }
    try{
        let response= await fetch(Api_Url,RequestOption)
        let data=await response.json()
       let apiResponse=data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim()
       text.innerHTML=apiResponse    
    }
    catch(error){
        console.log(error);
        text.innerHTML = "I apologize, but I'm having trouble processing your request. Please try again or provide more details about your crop issue."
    }
    finally{
        chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})
        image.src=`img.svg`
        image.classList.remove("choose")
        user.file={}
    }
}



function createChatBox(html,classes){
    let div=document.createElement("div")
    div.innerHTML=html
    div.classList.add(classes)
    return div
}


function handlechatResponse(userMessage){
    if (!userMessage.trim()) return;
    
    user.message=userMessage
    let html=`<img src="user.png" alt="" id="userImage" width="8%">
<div class="user-chat-area">
${user.message}
${user.file.data?`<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
</div>`
prompt.value=""
let userChatBox=createChatBox(html,"user-chat-box")
chatContainer.appendChild(userChatBox)

chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})

setTimeout(()=>{
let html=`<img src="ai.png" alt="" id="aiImage" width="10%">
    <div class="ai-chat-area">
    <img src="loading.webp" alt="" class="load" width="50px">
    </div>`
    let aiChatBox=createChatBox(html,"ai-chat-box")
    chatContainer.appendChild(aiChatBox)
    generateResponse(aiChatBox)

},600)

}


prompt.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
       handlechatResponse(prompt.value)

    }
})

submitbtn.addEventListener("click",()=>{
    handlechatResponse(prompt.value)
})
imageinput.addEventListener("change",()=>{
    const file=imageinput.files[0]
    if(!file) return
    let reader=new FileReader()
    reader.onload=(e)=>{
       let base64string=e.target.result.split(",")[1]
       user.file={
        mime_type:file.type,
        data: base64string
    }
    image.src=`data:${user.file.mime_type};base64,${user.file.data}`
    image.classList.add("choose")
    }
    
    reader.readAsDataURL(file)
})


imagebtn.addEventListener("click",()=>{
    imagebtn.querySelector("input").click()
})