import '../assets/styles/footer.styl'

export default {
    data() {
        return {
            author: 'littlehmy'
        }
    },
    render() {
        return (
            <div id="footer">
                <span>Power by {this.author}</span>
            </div>
        )
    }
}