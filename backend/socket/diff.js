export function check_diff_text(currentText, shadowText){
    /* Return: {
            start_idx: number,
            end_idx: number,
            text: string
        }
    */
    let s1_start = 0;
    let s2_start = 0;

    currentText = currentText ?? "";
    shadowText = shadowText ?? "";

    if (currentText === shadowText) return null;

    let s1_end = shadowText.length - 1;
    let s2_end = currentText.length - 1;

    while (
        s1_start <= s1_end
        && s2_start <= s2_end
        && shadowText[s1_start] === currentText[s2_start]
    ) {
        s1_start++;
        s2_start++;
    }

    while (
        s1_end >= s1_start
        && s2_end >= s2_start
        && shadowText[s1_end] === currentText[s2_end]
    ) {
        s1_end--;
        s2_end--;
    }

    return {
        start_idx: s1_start,
        end_idx: s1_end,
        text: currentText.slice(s2_start, s2_end + 1)
    }
}

export function getDiff(currentText, shadowText) {
    const diff = check_diff_text(currentText, shadowText);
    if(diff == null) return null;
    return diff;
}
