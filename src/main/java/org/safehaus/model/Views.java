package org.safehaus.model;


/**
 * Created by tzhamakeev on 5/22/15.
 */
public abstract class Views
{

    public interface CompleteView {}


    public interface JarvisIssueShort {}


    public interface JarvisIssueLong extends JarvisIssueShort {}


    public interface JarvisProjectShort {}


    public interface JarvisProjectLong extends JarvisProjectShort {}


    public interface JarvisSessionShort {}


    public interface JarvisSessionLong extends JarvisSessionShort {}


    public interface TimelineShort
    {
    }


    public interface TimelineLong extends TimelineShort
    {
    }
}
