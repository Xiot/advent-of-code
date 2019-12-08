function assert(expected, actual, message) {
    if (expected === actual) { return; }

    console.error(`\nERROR: ${message}\nExpected: ${expected}\nRecevied: ${actual}`);
    process.exit();
}

module.exports = {
    assert
};