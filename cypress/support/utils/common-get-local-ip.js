const ipDetails = {
    ip: null
};

export const getLocalIP = (forceFetch = false) => {
    if (!forceFetch && localStorage['ip']) {
        ipDetails.ip = localStorage['ip'];
        return ipDetails;
    }

    cy.api({
        method: "GET",
        url: 'https://api.ipify.org?format=json',
        headers: {
          'Content-Type': 'application/json'
        },
    })
    .then((resp) => {
        localStorage['ip'] = resp.body.ip;
        ipDetails.ip = resp.body.ip;
    });

    return ipDetails;
};