module.exports = (queue, track) => {
    queue.metadata.send(`Started playing ${track.title} in ${queue.connection.channel.name}`);
}