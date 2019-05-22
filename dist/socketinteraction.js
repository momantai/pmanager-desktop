socketuser.on('interaction', (msg) => {
    console.log(msg)
})

socketuser.on('notify', (msg) => {
    console.log(msg)
    vp.hasNotifications = true
    vp.newNotifications.push({'notification': msg.notification})
})