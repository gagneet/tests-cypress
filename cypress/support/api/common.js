export const standardApiHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'FromInternalProxy': true // Required for local testing as Devs usually run afoul of IPWhitelisting issues due to shared AWS environment.
}