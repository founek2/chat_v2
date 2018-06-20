const getCookie = (name) => {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

const auth = function (userName, passwd) {
    const options = {
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }),
        method: "POST",
      //  mode: 'same-origin',
        credentials: 'include',
        body: JSON.stringify({userName: userName, password: passwd})
    };
    console.log(userName, passwd)
    return fetch('/api/auth', options).then(function (response) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            if (response.ok) {
                return response.json();
            } else {
                alert("Unauthorized");
            }
        }
    }).then(function (response) {
        return response;
    }).catch(function (error) {
        console.log('There has been a problem with your fetch operation: ' + error);
    });
};

export {auth, getCookie}