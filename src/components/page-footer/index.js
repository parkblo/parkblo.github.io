import React from 'react';
import './style.scss';

function PageFooter({ author, githubUrl }) {
  return (
    <footer className="page-footer-wrapper">
      <p className="page-footer">
        © {new Date().getFullYear()}
        &nbsp;parkblo
        <a href="https://github.com/parkblo/parkblo.github.io">
          &nbsp;Github
        </a>
      </p>
    </footer>
  );
}

export default PageFooter;
