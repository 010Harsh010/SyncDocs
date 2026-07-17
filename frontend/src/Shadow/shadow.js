export class Shadow {
    constructor(document = { content: "" }) {
        this.shadowDocument = document;
        this.shadowText = document.content || "";
        this.currentText = "";
    }

    check_diff_text(){
        /* Return: {
                start_idx: number,
                end_idx: number,
                text: string
            }
        */
        let s1_start = 0;
        let s2_start = 0;

        let s1_end = this.shadowText.length - 1;
        let s2_end = this.currentText.length - 1;

        while (
            s1_start <= s1_end
            && s2_start <= s2_end
            && this.shadowText[s1_start] === this.currentText[s2_start]
        ) {
            s1_start++;
            s2_start++;
        }

        while (
            s1_end >= s1_start
            && s2_end >= s2_start
            && this.shadowText[s1_end] === this.currentText[s2_end]
        ) {
            s1_end--;
            s2_end--;
        }

        return {
            start_idx: s1_start,
            end_idx: s1_end,
            text: this.currentText.slice(s2_start, s2_end + 1)
        }
    }

    getDiff(currentText) {
        this.currentText = currentText;
        const temp_diff = this.check_diff_text();
        if(temp_diff == null) return null;
        this.diff = temp_diff;
        this.shadowText = this.currentText;
        return this.diff;
    }

    patch(diff) {
        this.shadowText = (
            this.shadowText.slice(0, diff.start_idx)
            + diff.text
            + this.shadowText.slice(diff.end_idx + 1)
        );

        return this.shadowText;
    }
}
