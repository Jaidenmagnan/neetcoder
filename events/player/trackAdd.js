module.exports = (queue, track) => {
    queue.metadata.send(`Added ${track.title} to queue`);
}