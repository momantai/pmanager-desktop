socketuser.on('interaction', (msg) => {
    console.log(msg)
})

socketuser.on('notify', (msg) => {
    vp.hasNotifications = true
    vp.newNotifications.push({'notification': msg.notification})
})