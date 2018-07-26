$(function() {

	// Text Area CKEditor
	if ($('textarea#ta').length) {
		CKEDITOR.replace('ta');
	}

	// Confirm Deletion Alert
	$('a.confirmDeletion').on('click', () => {
		if (!confirm('Confirm deletion'))
			return false;
	});
});