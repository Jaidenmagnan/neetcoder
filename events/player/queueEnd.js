module.exports = (queue) => {
    queue.metadata.send("Finished queue");
}