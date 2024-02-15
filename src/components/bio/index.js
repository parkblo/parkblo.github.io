import React from 'react';
import ReactRotatingText from 'react-rotating-text';
import IconButtonBar from '../icon-button-bar';
import Image from '../image';
import './style.scss';

function Bio({ author, language = 'ko' }) {
  if (!author) return null;
  const { bio, social, name } = author;
  return (
    <div className="bio">
        <div className="introduction korean">
          <p className="title">
            THIS IS DEV BLOG
            {/* <ReactRotatingText items={bio.description} />
            <br />
            {bio.role} <strong>{name}</strong>입니다. */} {/* Rotating Example*/}
            <br />
            <br />
          </p>
          <div className="social-links">
            <IconButtonBar links={social} />
          </div>
        </div>
      <div className="thumbnail-wrapper">
        {/* <Image style={{ width: 250, height: 250 }} src={bio.thumbnail} alt="thumbnail" /> */}
      </div>
    </div>
  );
}

export default Bio;
